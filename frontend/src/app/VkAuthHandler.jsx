import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleVkRedirect } from '../shared/auth'

/** Невидимый обработчик: ловит ?code от VK ID на старте и логинит пользователя. */
export default function VkAuthHandler() {
  const navigate = useNavigate()
  useEffect(() => { handleVkRedirect(navigate) }, [navigate])
  return null
}
