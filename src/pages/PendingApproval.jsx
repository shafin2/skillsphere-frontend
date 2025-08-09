import { Card, CardContent } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useNavigate } from 'react-router-dom'

export default function PendingApproval() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-semibold mb-2">Mentor application under review</h1>
            <p className="text-muted mb-6">We'll notify you once an admin approves your mentor role.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 