import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

type WeatherData = {
  city_name: string
  country: string | null
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  description: string
}

type WeatherLog = {
  id: number
  city: string
  country: string | null
  created_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function App() {
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [weatherHistory, setWeatherHistory] = useState<WeatherLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsContentVisible(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    async function loadWeatherHistory() {
      try {
        const response = await fetch(`${API_BASE_URL}/weather/history?skip=0&limit=5`)

        if (!response.ok) {
          return
        }

        const history: WeatherLog[] = await response.json()
        setWeatherHistory(history)
      } catch {
        return
      }
    }

    void loadWeatherHistory()
  }, [])

  async function handleSearch() {
    if (!search.trim()) {
      toast('Preencha o campo Cidade!', {
        icon: '⚠',
        style: {
          background: '#18c56c',
          color: '#334155',
          fontWeight: 600,
        },
      })
      return
    }

    setIsLoading(true)
    setWeatherData(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/weather/search?city=${encodeURIComponent(search.trim())}`,
      )

      if (response.status === 404) {
        toast.error('Cidade não encontrada!', {
          icon: '✕',
          style: {
            background: '#ff4d4d',
            color: '#ffffff',
            fontWeight: 600,
          },
        })
        return
      }

      if (!response.ok) {
        throw new Error('Não foi possível consultar a cidade.')
      }

      const data: WeatherData = await response.json()
      setWeatherData(data)
      toast.success('Dados retornados com sucesso!', {
        icon: '✓',
        style: {
            background: '#00cc88',
            color: '#ffffff',
            fontWeight: 600,
          },
      })
    } catch {
      toast.error('Não foi possível consultar a cidade.', {
        icon: '✕',
        style: {
          background: '#ff4d4d',
          color: '#ffffff',
          fontWeight: 600,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleClearSearch() {
    setSearch('')
    setWeatherData(null)
  }

  async function handleSaveSearch() {
    if (!weatherData) {
      return
    }

    setIsLoading(true)

    try {
      const saveResponse = await fetch(
        `${API_BASE_URL}/weather/save?city=${encodeURIComponent(weatherData.city_name)}`,
        { method: 'POST' },
      )

      if (!saveResponse.ok) {
        throw new Error('Não foi possível salvar a pesquisa.')
      }

      const historyResponse = await fetch(`${API_BASE_URL}/weather/history?skip=0&limit=5`)

      if (!historyResponse.ok) {
        throw new Error('Não foi possível carregar o histórico.')
      }

      const history: WeatherLog[] = await historyResponse.json()
      setWeatherHistory(history)
      toast.success('Pesquisa salva com sucesso!', {
        icon: '✓',
        style: {
            background: '#00cc88',
            color: '#ffffff',
            fontWeight: 600,
          },
       })
    } catch {
      toast.error('Não foi possível salvar a pesquisa.', {
        icon: '✕',
        style: {
          background: '#ff4d4d',
          color: '#ffffff',
          fontWeight: 600,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-3 text-white sm:p-4">
      <Toaster position="top-right" />
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <p className="text-xl font-semibold text-white">Aguarde</p>
          <div
            className="mt-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-sky-400"
            role="status"
            aria-label="Carregando"
          />
        </div>
      )}
      <div
        className={`text-center w-full transition-opacity duration-[5000ms] ease-out ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold text-sky-400 sm:text-3xl">
            CnTech + OpenWeather API
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
            Consulta e persistência de dados climáticos por cidade
          </p>
        </header>

        <div className={`mx-auto grid w-full items-start justify-center gap-4 sm:gap-6 ${
          weatherData && weatherHistory.length > 0
            ? 'max-w-[88rem] lg:grid-cols-2 xl:grid-cols-[28rem_28rem_24rem]'
            : weatherData || weatherHistory.length > 0
              ? 'max-w-[60rem] lg:grid-cols-2'
              : 'max-w-md'
        }`}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void handleSearch()
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-2xl sm:rounded-xl sm:p-8"
          >
            <input
              type="text"
              name="search"
              id="search"
              placeholder="pesquisar cidade"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-base"
            />
            <div className="mt-3 flex justify-end sm:mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-base"
              >
                Pesquisar
              </button>
            </div>
          </form>

          {weatherData && (
            <div className="space-y-4">
              <div className="w-full rounded-lg border border-slate-700 bg-slate-800 text-left shadow-2xl sm:rounded-xl">
                <table className="w-full table-fixed text-xs sm:text-sm">
                  <tbody className="divide-y divide-slate-700">
                    {[
                      ['Cidade', `${weatherData.city_name}${weatherData.country ? `, ${weatherData.country}` : ''}`],
                      ['Temperatura', `${weatherData.temp} °C`],
                      ['Sensação térmica', `${weatherData.feels_like} °C`],
                      ['Temperatura mínima', `${weatherData.temp_min} °C`],
                      ['Temperatura máxima', `${weatherData.temp_max} °C`],
                      ['Umidade', `${weatherData.humidity}%`],
                      ['Descrição', weatherData.description],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <th className="w-1/2 break-words px-3 py-3 font-medium text-slate-400 sm:px-5 sm:py-4">{label}</th>
                        <td className="w-1/2 break-words px-3 py-3 font-semibold text-white sm:px-5 sm:py-4">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  disabled={isLoading}
                  className="cursor-pointer rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-base"
                >
                  Limpar pesquisa
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveSearch()}
                  disabled={isLoading}
                  className="cursor-pointer rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-base"
                >
                  Salvar Pesquisa
                </button>
              </div>
            </div>
          )}

          {weatherHistory.length > 0 && (
            <div className="w-full rounded-lg border border-slate-700 bg-slate-800 p-4 text-left shadow-2xl sm:rounded-xl sm:p-5 xl:max-w-[24rem] xl:justify-self-center">
              <h2 className="mb-4 text-base font-semibold text-sky-400 sm:text-lg">
                Últimas cidades pesquisadas:
              </h2>
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
                    <th className="w-2/3 break-words px-2 pb-3 font-medium sm:px-3">Cidade, país</th>
                    <th className="w-1/3 break-words px-2 pb-3 font-medium sm:px-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {weatherHistory.map((log) => (
                    <tr key={log.id}>
                      <td className="break-words px-2 py-3 text-white sm:px-3">
                        {log.city}{log.country ? `, ${log.country}` : ''}
                      </td>
                      <td className="break-words px-2 py-3 text-slate-300 sm:px-3">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}