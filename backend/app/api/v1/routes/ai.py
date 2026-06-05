import json
import logging
import re
from datetime import date

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

_SYSTEM_PROMPT = (
    "Sen bir su-enerji verimliliği uzmanısın. Fabrika operatörlerine ve yöneticilerine "
    "kısa, aksiyon odaklı Türkçe analizler üretiyorsun. "
    "Sadece JSON formatında yanıt ver, başka hiçbir şey yazma."
)

_REPORT_SYSTEM_PROMPT = (
    "Sen Türkiye'deki kamu kurumlarına su-enerji verimliliği danışmanlığı yapan uzman bir analistin. "
    "Yöneticiler ve denetim organları için Türk kamu kurumlarının faaliyet raporu standartlarına uygun, "
    "resmi ve aksiyon odaklı Türkçe raporlar hazırlıyorsun. "
    "Sadece JSON formatında yanıt ver, başka hiçbir şey yazma."
)


def _extract_json(raw: str) -> dict:
    """Markdown kod bloğu fence'lerini soyarak JSON parse et."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    return json.loads(cleaned)


def _run_rule_engine(
    nexus_ratio: float,
    energy_value: float,
    water_value: float,
    anomaly_flag: bool,
) -> list[str]:
    findings: list[str] = []

    if energy_value > 16.0 and water_value < 9.0:
        findings.append("Enerji yüksek, su düşük: mekanik sürtünme veya pompa arızası riski.")
    if nexus_ratio > 1.5:
        findings.append("Nexus oranı kritik eşiği aştı: sistem verimsiz çalışıyor.")
    if nexus_ratio < 0.5:
        findings.append("Nexus oranı çok düşük: aşırı su tüketimi veya enerji kaybı olabilir.")
    if anomaly_flag and nexus_ratio > 1.2:
        findings.append("Anomali aktif ve Nexus yüksek: acil teknik müdahale önerilir.")
    if water_value == 0:
        findings.append("Su tüketimi sıfır: sensör arızası veya su kesintisi olabilir.")

    return findings


def _build_summary_prompt(
    nexus_ratio: float,
    energy_value: float,
    water_value: float,
    anomaly_flag: bool,
    rule_findings: list[str],
) -> str:
    anomaly_str = "Var" if anomaly_flag else "Yok"
    rule_block = ""
    if rule_findings:
        rule_lines = "\n".join(f"- {finding}" for finding in rule_findings)
        rule_block = f"Kural Motoru Tespitleri:\n{rule_lines}\n\n"

    return (
        f"Aşağıdaki anlık fabrika verisini analiz et:\n"
        f"- Nexus Ratio: {nexus_ratio} (Normal aralık: 0.8 - 1.2)\n"
        f"- Enerji Tüketimi: {energy_value} kWh\n"
        f"- Su Tüketimi: {water_value} m³\n"
        f"- Anomali Durumu: {anomaly_str}\n\n"
        f"{rule_block}"
        'Şu JSON formatında yanıt ver:\n'
        '{\n'
        '  "summary": "2-3 cümle yönetici özeti",\n'
        '  "risk_level": "normal veya warning veya critical",\n'
        '  "action": "varsa önerilen aksiyon, yoksa null"\n'
        '}'
    )


def _build_report_prompt(
    period: str,
    nexus_ratio: float,
    energy_value: float,
    water_value: float,
    anomaly_flag: bool,
    report_date: str,
) -> str:
    period_label = "Haftalık" if period == "weekly" else "Aylık"
    anomaly_str = "Tespit edildi" if anomaly_flag else "Tespit edilmedi"
    return (
        f"Aşağıdaki fabrika telemetri verilerine dayanarak resmi bir {period_label} Faaliyet Raporu hazırla.\n\n"
        f"VERİ:\n"
        f"- Rapor Dönemi: {period_label} ({report_date})\n"
        f"- Nexus Oranı (Rn): {nexus_ratio:.3f} (Normal aralık: 0.8–1.2)\n"
        f"- Enerji Tüketimi: {energy_value:.2f} kWh\n"
        f"- Su Tüketimi: {water_value:.2f} m³\n"
        f"- Anomali: {anomaly_str}\n\n"
        "Aşağıdaki JSON formatında yanıt ver; tüm alanları Türkçe ve kamu kurumu üslubuyla doldur:\n"
        "{\n"
        '  "period_label": "Haftalık veya Aylık",\n'
        '  "risk_level": "normal veya warning veya critical",\n'
        '  "executive_summary": "3-4 cümle yönetici özeti — dönemin genel performansını belirt",\n'
        '  "findings": [\n'
        '    "Birinci önemli bulgu cümlesi",\n'
        '    "İkinci önemli bulgu cümlesi",\n'
        '    "Üçüncü önemli bulgu cümlesi"\n'
        '  ],\n'
        '  "risk_assessment": "2-3 cümle risk değerlendirmesi",\n'
        '  "recommendations": [\n'
        '    "Birinci öneri maddesi",\n'
        '    "İkinci öneri maddesi",\n'
        '    "Üçüncü öneri maddesi"\n'
        '  ],\n'
        '  "compliance_note": "Kamu denetim organlarına not — mevzuat uyumu veya bildirme yükümlülüğü"\n'
        "}"
    )


async def _call_openrouter(messages: list[dict], settings) -> str:
    payload = {
        "model": settings.ai_model,
        "messages": messages,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            _OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "WEN Nexus",
            },
            json=payload,
        )
        if not response.is_success:
            logger.error(
                "OpenRouter hata döndürdü. Status: %s | Body: %s",
                response.status_code,
                response.text,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"OpenRouter hatası ({response.status_code}): {response.text}",
            )
        data = response.json()
    return data["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# GET /ai/summary — anlık telemetri özeti
# ---------------------------------------------------------------------------

@router.get("/summary", summary="AI destekli telemetri özeti")
async def get_ai_summary(
    energy_value: float = Query(..., description="Enerji tüketimi (kWh)"),
    water_value: float = Query(..., description="Su tüketimi (m³)"),
    nexus_ratio: float = Query(..., description="Enerji/Su oranı"),
    anomaly_flag: bool = Query(..., description="Anomali var mı?"),
    _: User = Depends(get_current_user),
) -> dict:
    settings = get_settings()

    if not settings.openrouter_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENROUTER_API_KEY tanımlanmamış. backend/.env dosyasını kontrol et.",
        )

    key_preview = settings.openrouter_api_key[:8] + "..."
    logger.info(
        "OpenRouter özet isteği. Key: %s | Model: %s",
        key_preview,
        settings.ai_model,
    )

    rule_findings = _run_rule_engine(nexus_ratio, energy_value, water_value, anomaly_flag)

    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {
            "role": "user",
            "content": _build_summary_prompt(
                nexus_ratio=nexus_ratio,
                energy_value=energy_value,
                water_value=water_value,
                anomaly_flag=anomaly_flag,
                rule_findings=rule_findings,
            ),
        },
    ]

    raw_content = await _call_openrouter(messages, settings)

    try:
        return _extract_json(raw_content)
    except (json.JSONDecodeError, KeyError, ValueError):
        logger.warning("JSON parse başarısız, ham içerik döndürülüyor.")
        return {"summary": raw_content, "risk_level": None, "action": None}


# ---------------------------------------------------------------------------
# GET /ai/report — haftalık / aylık faaliyet raporu
# ---------------------------------------------------------------------------

@router.get("/report", summary="AI destekli haftalık/aylık faaliyet raporu")
async def get_ai_report(
    period: str = Query(..., description="'weekly' veya 'monthly'"),
    energy_value: float = Query(..., description="Enerji tüketimi (kWh)"),
    water_value: float = Query(..., description="Su tüketimi (m³)"),
    nexus_ratio: float = Query(..., description="Enerji/Su oranı"),
    anomaly_flag: bool = Query(..., description="Anomali var mı?"),
    _: User = Depends(get_current_user),
) -> dict:
    if period not in ("weekly", "monthly"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="period parametresi 'weekly' veya 'monthly' olmalıdır.",
        )

    settings = get_settings()

    if not settings.openrouter_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENROUTER_API_KEY tanımlanmamış. backend/.env dosyasını kontrol et.",
        )

    report_date = date.today().strftime("%d.%m.%Y")
    logger.info("AI rapor isteği. Dönem: %s | Model: %s", period, settings.ai_model)

    messages = [
        {"role": "system", "content": _REPORT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": _build_report_prompt(
                period=period,
                nexus_ratio=nexus_ratio,
                energy_value=energy_value,
                water_value=water_value,
                anomaly_flag=anomaly_flag,
                report_date=report_date,
            ),
        },
    ]

    raw_content = await _call_openrouter(messages, settings)

    try:
        parsed = _extract_json(raw_content)
        parsed["report_date"] = report_date
        parsed["period"] = period
        return parsed
    except (json.JSONDecodeError, KeyError, ValueError):
        logger.warning("Rapor JSON parse başarısız, ham içerik döndürülüyor.")
        return {
            "period": period,
            "period_label": "Haftalık" if period == "weekly" else "Aylık",
            "report_date": report_date,
            "risk_level": None,
            "executive_summary": raw_content,
            "findings": [],
            "risk_assessment": "",
            "recommendations": [],
            "compliance_note": "",
        }


# ---------------------------------------------------------------------------
# POST /ai/chat — serbest metin chatbot
# ---------------------------------------------------------------------------

_CHAT_SYSTEM_PROMPT = (
    "Sen WEN Nexus sisteminin yapay zeka asistanısın. "
    "Su-enerji verimliliği, Nexus Ratio, anomali yönetimi ve fabrika operasyonları konularında "
    "fabrika operatörlerine ve yöneticilerine yardımcı oluyorsun. "
    "Yanıtlarını kısa, net ve Türkçe ver. Teknik bilgiyi sade bir dille açıkla. "
    "Kullanıcı sana dashboard'daki grafik veya tablo hakkında soru sorarsa, "
    "sana iletilen [Dashboard Durumu] bloğundaki verilere dayanarak somut cevap ver."
)


class TrendPoint(BaseModel):
    month: str
    energy: float
    water: float


class ChatContext(BaseModel):
    energy_kwh: float | None = None
    water_m3: float | None = None
    nexus_ratio: float | None = None
    anomaly_flag: bool | None = None
    crisis_level: str | None = None
    selected_factory: str | None = None
    trend_data: list[TrendPoint] | None = None


class ChatRequest(BaseModel):
    message: str
    context: ChatContext | None = None


class ChatResponse(BaseModel):
    reply: str


def _build_context_block(ctx: ChatContext) -> str:
    lines = ["[Dashboard Durumu — Anlık]"]
    if ctx.selected_factory:
        lines.append(f"- Kapsam: {ctx.selected_factory}")
    if ctx.energy_kwh is not None:
        lines.append(f"- Enerji Tüketimi: {ctx.energy_kwh:.2f} kWh")
    if ctx.water_m3 is not None:
        lines.append(f"- Su Tüketimi: {ctx.water_m3:.2f} m³")
    if ctx.nexus_ratio is not None:
        lines.append(f"- Nexus Oranı (Rn): {ctx.nexus_ratio:.3f}  (Normal: 0.8–1.2)")
    if ctx.anomaly_flag is not None:
        lines.append(f"- Anomali: {'Tespit edildi' if ctx.anomaly_flag else 'Yok'}")
    if ctx.crisis_level:
        lines.append(f"- Kriz Seviyesi: {ctx.crisis_level}")
    if ctx.trend_data:
        trend_str = " | ".join(
            f"{p.month}: E={p.energy:.1f} kWh, S={p.water:.1f} m³"
            for p in ctx.trend_data
        )
        lines.append(f"- Dönemsel Trend (Son {len(ctx.trend_data)} ay): {trend_str}")
    return "\n".join(lines)


@router.post("/chat", response_model=ChatResponse, summary="AI sohbet asistanı")
async def post_chat(
    body: ChatRequest,
    _: User = Depends(get_current_user),
) -> ChatResponse:
    settings = get_settings()

    if not settings.openrouter_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENROUTER_API_KEY tanımlanmamış. backend/.env dosyasını kontrol et.",
        )

    key_preview = settings.openrouter_api_key[:8] + "..."
    has_context = body.context is not None
    logger.info(
        "AI chat isteği. Key: %s | Model: %s | Context: %s",
        key_preview,
        settings.ai_model,
        "var" if has_context else "yok",
    )

    system_content = _CHAT_SYSTEM_PROMPT
    if body.context:
        system_content += "\n\n" + _build_context_block(body.context)

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": body.message},
    ]

    reply = await _call_openrouter(messages, settings)
    return ChatResponse(reply=reply)
