\# PROJECT WEN: WATER-ENERGY NEXUS DECISION SUPPORT SYSTEM (PRD &
FRONTEND SPEC)

\## 1. Project Overview & Context WEN is an industrial decision-support
system designed to optimize the relationship between water and energy
consumption. The application serves two primary personas: \*\*Strategic
(Executives)\*\* for ESG and cost analysis, and \*\*Technical
(Engineers)\*\* for real-time sensor monitoring and crisis management.

\## 2. Core Logic & Mathematical Models The system is driven by the
\*\*Nexus Engine\*\*. All frontend visualizations must adhere to these
calculations:

\### A. The Nexus Ratio Formula The fundamental metric is the Nexus
Ratio (\$R_n\$): \$\$R_n = \\frac{E_t}{W_t}\$\$ \* \$E_t\$: Total Energy
Consumption (kWh). \* \$W_t\$: Total Water Consumption (\$m\^3\$).

\### B. Decision Thresholds & Logic Levels The UI must dynamically
change themes based on the current \$R_n\$: 1. \*\*Normal (Green):\*\*
\$0.8 \\le R_n \\le 1.2\$ --- System is optimized. 2. \*\*Warning
(Yellow):\*\* \$1.2 \< R_n \\le 1.5\$ --- System enters \*\*Observation
Mode\*\*. 3. \*\*Alert (Orange):\*\* \$R_n \> 1.5\$ (or manual trigger)
--- \*\*Preparation Protocol\*\* starts. 4. \*\*Critical (Red):\*\*
Threshold breach + manual escalation --- \*\*Action Protocol (Kod
Kırmızı)\*\*.

\## 3. Tech Stack Requirements \* \*\*Framework:\*\* React 18+ with
TypeScript (Vite). \* \*\*Styling:\*\* Tailwind CSS (Dark Mode as
default: \`bg-\[#07090f\]\`). \* \*\*State Management:\*\* Zustand (for
Global Crisis State and User Role). \* \*\*Data Fetching:\*\* TanStack
Query (Polling for Strategic: 30s, WebSocket/MQTT for Technical: 10s).
\* \*\*Icons:\*\* Lucide-React. \* \*\*Charts:\*\* ApexCharts or
Recharts (Multi-axis for Technical, Gauges for Strategic).

\## 4. Role-Based Access Control (RBAC) \* \*\*Strategic Role
(Arif/Selin):\*\* Access to \`/dashboard-strategic\`, \`/analysis\`,
\`/reports\`, \`/notifications\`. \* \*\*Technical Role
(Emre/Fatih):\*\* Access to \`/dashboard-technical\`, \`/thresholds\`,
\`/historical\`, \`/anomalies\`. \* \*\*Common:\*\* \`/login\`,
\`/crisis\`, \`/settings\`.

\## 5. Detailed Component & UI Mapping

\### A. The Global Header \* \*\*Status Indicators:\*\* MQTT Connection
status, System Health, User Profile. \* \*\*Fallback Logic:\*\* If MQTT
fails, show \"Data Offline\" banner and switch to \*\*Redis Fallback\*\*
mode.

\### B. Strategic Dashboard (\`/dashboard-strategic\`) \* \*\*KPI
Cards:\*\* Energy (kWh), Water (\$m\^3\$), and Nexus Ratio. \* \*\*Nexus
Gauge:\*\* A circular gauge reflecting \$R_n\$ with dynamic coloring. \*
\*\*Action Banner:\*\* Appears only if a crisis is active.

\### C. Technical Dashboard (\`/dashboard-technical\`) \* \*\*Real-time
Chart:\*\* Multi-axis line chart showing Energy and Water flow
simultaneously. \* \*\*Threshold Overlay:\*\* Horizontal dashed lines
indicating min/max limits. \* \*\*Recent Data Table:\*\* Last 10 data
packets received via WebSocket.

\### D. Crisis Protocol Engine (\`/crisis\`) This is a state-machine
based UI: \* \*\*Yellow Level:\*\* Passive warning bar. \* \*\*Orange
Level:\*\* Preparation checklist with \"Notify Team\" button. \* \*\*Red
Level (Kod Kırmızı):\*\* \* Flashing red backgrounds and audible alerts.
\* \*\*Sequenced Checklist:\*\* 1. Stop Pump \$\\rightarrow\$ 2. Close
Valve \$\\rightarrow\$ 3. Call Emergency. \* \*\*Audit Trail:\*\* Every
checkbox click must trigger a PUT request with \`timestamp\` and
\`user_id\`.

\## 6. Full User Flow Architecture (Mermaid)

\`\`\`mermaid graph TD %% Global Styles classDef strategic
fill:#0f1e38,stroke:#22a7d8,stroke-width:2px,color:#fff; classDef
technical fill:#0f1e38,stroke:#f0a500,stroke-width:2px,color:#fff;
classDef crisis fill:#450a0a,stroke:#ef4444,stroke-width:3px,color:#fff;
classDef system
fill:#0d1117,stroke:#21293d,stroke-width:1px,color:#8899b3;

%% Entry Start((App Init)) \--\> Login\[🔐 /login\] Login \--\>\|JWT
Auth\| RBAC{Role Check}

%% Strategic Flow RBAC \-- role: STRATEGIC \--\> SDash\[📊 Strategic
Dashboard\] subgraph S_Module \[Strategic View\] SDash \--\> S_KPI\[KPI
Cards: E, W, Nexus\] SDash \--\> S_Gauge\[Dynamic Nexus Gauge\] SDash
\--\> Analysis\[🎯 /analysis - Trend Analysis\] SDash \--\> Reports\[📄
/reports - ESG & PDF Export\] end

%% Technical Flow RBAC \-- role: TECHNICAL \--\> TDash\[🔬 Technical
Dashboard\] subgraph T_Module \[Technical View\] TDash \--\>
T_Live\[MQTT Live Stream Charts\] TDash \--\> Thresholds\[⚙️
/thresholds - Sensor Config\] TDash \--\> History\[📉 /historical - Raw
Data Export\] TDash \--\> Anomalies\[⚠️ /anomalies - Incident Logs\] end

%% Crisis Interceptor S_Module & T_Module \--\> CrisisLogic{Anomaly?}
CrisisLogic \-- YES \--\> GlobalCrisis\[🔴 Global Crisis State ACTIVE\]
GlobalCrisis \--\> CrisisPage\[🚨 /crisis - ACTION PROTOCOL\]

subgraph Crisis_Steps \[Crisis Levels\] CrisisPage \--\> Level_Y\[🟡
Yellow: Observation\] CrisisPage \--\> Level_O\[🟠 Orange: Prep
Checklist\] CrisisPage \--\> Level_R\[🔴 Red: Manual Actions\] Level_R
\--\> Action_1\[Adım 1: Pompayı Durdur\] Action_1 \--\> Action_2\[Adım
2: Valfi Kapat\] Action_2 \--\> Resolution\[✅ /crisis/resolve - Close
Incident\] end

%% Settings & Exit S_Module & T_Module \--\> Settings\[⚙️ /settings\]
Settings \--\> Logout\[📤 Logout\]

%% Color Mapping class SDash,Analysis,Reports,S_KPI,S_Gauge strategic;
class TDash,T_Live,Thresholds,History,Anomalies technical; class
CrisisPage,Level_R,GlobalCrisis,Action_1,Action_2,Resolution crisis;
class Login,RBAC,Settings,Logout system; \`\`\`

\## 7. Implementation Tasks for Cursor 1. \*\*Generate \`useNexus\`
Hook:\*\* To calculate the ratio and determine system health status
globally. 2. \*\*Create \`ProtectedRoute\` Component:\*\* To handle RBAC
between Strategic and Technical routes. 3. \*\*Build
\`CrisisProvider\`:\*\* A React Context/Zustand store to manage
\`crisisLevel\` and global UI overlays. 4. \*\*Implement
\`PDFReportExporter\`:\*\* Using a mock for the WeasyPrint API to
download ESG reports. 5. \*\*Design \`ChecklistComponent\`:\*\* A
reusable, timestamp-logging component for the Kod Kırmızı protocol.
