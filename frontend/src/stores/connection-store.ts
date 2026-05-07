import { create } from 'zustand'

type ConnectionState = {
  mqttConnected: boolean
  redisFallbackActive: boolean
  setMqttConnected: (v: boolean) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  mqttConnected: true,
  redisFallbackActive: false,
  setMqttConnected: (mqttConnected) =>
    set({
      mqttConnected,
      redisFallbackActive: !mqttConnected,
    }),
}))
