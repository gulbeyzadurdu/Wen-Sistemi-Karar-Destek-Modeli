export type FactoryStatus = 'Online' | 'Offline' | 'Warning'

export type Factory = {
  id: string
  name: string
  nexusRatio: number
  energyConsumption: number
  waterConsumption: number
  status: FactoryStatus
}

export const FACTORIES: Factory[] = [
  {
    id: 'tekstil-a',
    name: 'Tekstil-A',
    nexusRatio: 1.08,
    energyConsumption: 13.4,
    waterConsumption: 10.6,
    status: 'Online',
  },
  {
    id: 'otomotiv-b',
    name: 'Otomotiv-B',
    nexusRatio: 1.34,
    energyConsumption: 16.9,
    waterConsumption: 10.9,
    status: 'Warning',
  },
  {
    id: 'gida-c',
    name: 'Gida-C',
    nexusRatio: 0.91,
    energyConsumption: 11.2,
    waterConsumption: 12.3,
    status: 'Online',
  },
  {
    id: 'kimya-d',
    name: 'Kimya-D',
    nexusRatio: 1.57,
    energyConsumption: 18.6,
    waterConsumption: 11.8,
    status: 'Offline',
  },
]
