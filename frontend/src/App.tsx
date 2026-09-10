import { Button, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'

const { Title, Text } = Typography

async function fetchHealth() {
  const res = await fetch('/api/v1/health')
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

function App() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    enabled: false,
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Title level={2}>Elora</Title>
      <Text type="secondary">React + Vite + Tailwind + Ant Design + React Query</Text>
      <Button type="primary" onClick={() => refetch()} loading={isFetching}>
        Check backend health
      </Button>
      {isError && <Text type="danger">Could not reach backend</Text>}
      {data && <Text type="success">Backend says: {JSON.stringify(data)}</Text>}
    </div>
  )
}

export default App
