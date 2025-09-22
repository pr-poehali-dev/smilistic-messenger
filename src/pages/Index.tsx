import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface Chat {
  id: number
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  type: 'personal' | 'group'
}

interface Story {
  id: number
  name: string
  avatar: string
  hasStory: boolean
  isOwn?: boolean
}

interface Message {
  id: number
  content: string
  timestamp: string
  isSent: boolean
  type: 'text' | 'voice' | 'image'
  duration?: string
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'calls' | 'settings'>('chats')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stories, setStories] = useState<Story[]>([])

  // Check if user is authenticated
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        loadUserData()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      // Load chats
      const chatsResponse = await fetch('/api/chats')
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        setChats(chatsData)
      }

      // Load stories
      const storiesResponse = await fetch('/api/stories')
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        setStories([
          { id: 0, name: 'Ваша история', avatar: user?.avatar || '/placeholder.svg', hasStory: false, isOwn: true },
          ...storiesData
        ])
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return

    const newMessage: Message = {
      id: Date.now(),
      content: message,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      type: 'text'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: message,
          type: 'text'
        })
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const startCall = async (type: 'audio' | 'video') => {
    if (!selectedChat) return
    
    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          type
        })
      })
      
      if (response.ok) {
        const callData = await response.json()
        // Here you would integrate with WebRTC for actual calling
        alert(`${type === 'video' ? 'Видео' : 'Аудио'} звонок ${selectedChat.name}`)
      }
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-8">
            <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-semibold mb-2">Добро пожаловать</h1>
            <p className="text-muted-foreground">Войдите с помощью Google, чтобы начать общение</p>
          </div>
          
          <Button 
            onClick={handleGoogleLogin}
            size="lg"
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </Button>
        </div>
      </div>
    )
  }

  const VoiceWaveAnimation = () => (
    <div className="flex items-center space-x-1 h-6">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-wave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: Math.random() * 16 + 4 + 'px'
          }}
        />
      ))}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <div className="flex h-full">
            {/* Sidebar with chats */}
            <div className="w-80 border-r border-border bg-card flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-semibold mb-4">Чаты</h1>
                
                {/* Stories */}
                <div className="mb-4">
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {stories.map((story) => (
                      <div key={story.id} className="flex flex-col items-center space-y-1 min-w-fit">
                        <div className={`relative ${story.hasStory ? 'ring-2 ring-primary ring-offset-2' : ''} rounded-full`}>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={story.avatar} />
                            <AvatarFallback>{story.name[0]}</AvatarFallback>
                          </Avatar>
                          {story.isOwn && !story.hasStory && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate w-14 text-center">
                          {story.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Поиск чатов..." 
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет активных чатов</p>
                    <p className="text-sm text-muted-foreground">Найдите друзей, чтобы начать общение</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-accent transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{chat.name}</h3>
                            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unread > 0 && (
                              <Badge variant="default" className="ml-2">
                                {chat.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat window */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{selectedChat.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.online ? 'в сети' : 'был недавно'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => startCall('audio')}>
                      <Icon name="Phone" size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startCall('video')}>
                      <Icon name="Video" size={20} />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Начните переписку!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} animate-slide-up`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.isSent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {msg.type === 'voice' ? (
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="w-8 h-8">
                                <Icon name="Play" size={16} />
                              </Button>
                              <VoiceWaveAnimation />
                              <span className="text-xs">{msg.duration}</span>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Сообщение..."
                        className="pr-12"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1 w-8 h-8"
                      >
                        <Icon name="Paperclip" size={16} />
                      </Button>
                    </div>
                    
                    {message.trim() ? (
                      <Button size="icon" onClick={handleSendMessage}>
                        <Icon name="Send" size={16} />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant={isRecording ? "destructive" : "default"}
                        onMouseDown={() => setIsRecording(true)}
                        onMouseUp={() => setIsRecording(false)}
                        onMouseLeave={() => setIsRecording(false)}
                      >
                        <Icon name="Mic" size={16} />
                      </Button>
                    )}
                  </div>
                  {isRecording && (
                    <div className="mt-2 flex items-center space-x-2 animate-fade-in">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm text-muted-foreground">Запись голосового сообщения...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Выберите чат</h3>
                  <p className="text-muted-foreground">Выберите чат, чтобы начать общение</p>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'contacts':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Контакты</h2>
            <div className="text-center py-8">
              <Icon name="Users" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Здесь будут ваши контакты</p>
            </div>
          </div>
        )
      
      case 'calls':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Звонки</h2>
            <div className="text-center py-8">
              <Icon name="Phone" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">История звонков пуста</p>
            </div>
          </div>
        )
      
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Настройки</h2>
            
            {/* Profile section */}
            <div className="bg-card p-6 rounded-lg mb-6 border">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/api/auth/logout'}>
                Выйти
              </Button>
            </div>

            {/* Settings options */}
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Bell" size={16} className="mr-3" />
                Уведомления
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Lock" size={16} className="mr-3" />
                Конфиденциальность
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Palette" size={16} className="mr-3" />
                Оформление
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="HelpCircle" size={16} className="mr-3" />
                Помощь
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-border bg-card p-2">
        <div className="flex justify-around">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('chats')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Icon name="MessageCircle" size={20} />
            <span className="text-xs mt-1">Чаты</span>
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('contacts')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Icon name="Users" size={20} />
            <span className="text-xs mt-1">Контакты</span>
          </Button>
          <Button
            variant={activeTab === 'calls' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('calls')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Icon name="Phone" size={20} />
            <span className="text-xs mt-1">Звонки</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="flex-1 flex flex-col items-center py-2"
          >
            <Icon name="Settings" size={20} />
            <span className="text-xs mt-1">Настройки</span>
          </Button>
        </div>
      </div>
    </div>
  )
}