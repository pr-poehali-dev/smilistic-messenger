import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

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

const stories: Story[] = [
  { id: 0, name: 'Ваша история', avatar: '/placeholder.svg', hasStory: false, isOwn: true },
  { id: 1, name: 'Анна', avatar: '/placeholder.svg', hasStory: true },
  { id: 2, name: 'Макс', avatar: '/placeholder.svg', hasStory: true },
  { id: 3, name: 'Елена', avatar: '/placeholder.svg', hasStory: true },
  { id: 4, name: 'Дмитрий', avatar: '/placeholder.svg', hasStory: true },
]

const chats: Chat[] = [
  {
    id: 1,
    name: 'Анна Петрова',
    avatar: '/placeholder.svg',
    lastMessage: 'Привет! Как дела?',
    timestamp: '14:23',
    unread: 2,
    online: true,
    type: 'personal'
  },
  {
    id: 2,
    name: 'Команда разработки',
    avatar: '/placeholder.svg',
    lastMessage: 'Отлично! Встретимся завтра',
    timestamp: '12:45',
    unread: 0,
    online: false,
    type: 'group'
  },
  {
    id: 3,
    name: 'Максим Иванов',
    avatar: '/placeholder.svg',
    lastMessage: '📎 Документ',
    timestamp: 'Вчера',
    unread: 1,
    online: true,
    type: 'personal'
  },
  {
    id: 4,
    name: 'Мама',
    avatar: '/placeholder.svg',
    lastMessage: 'Не забудь позвонить бабушке',
    timestamp: 'Вчера',
    unread: 0,
    online: false,
    type: 'personal'
  }
]

const messages: Message[] = [
  {
    id: 1,
    content: 'Привет! Как твои дела?',
    timestamp: '14:20',
    isSent: false,
    type: 'text'
  },
  {
    id: 2,
    content: 'Отлично! Работаю над новым проектом',
    timestamp: '14:21',
    isSent: true,
    type: 'text'
  },
  {
    id: 3,
    content: 'Голосовое сообщение',
    timestamp: '14:22',
    isSent: false,
    type: 'voice',
    duration: '0:15'
  },
  {
    id: 4,
    content: 'Звучит интересно! Расскажешь подробнее?',
    timestamp: '14:23',
    isSent: true,
    type: 'text'
  }
]

export default function Index() {
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'calls' | 'settings'>('chats')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0])
  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState('')

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
                {chats.map((chat) => (
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
                ))}
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
                    <Button variant="ghost" size="icon">
                      <Icon name="Phone" size={20} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Video" size={20} />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
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
                  ))}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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
                      <Button size="icon">
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
            <div className="space-y-4">
              {chats.filter(chat => chat.type === 'personal').map((contact) => (
                <div key={contact.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent">
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {contact.online ? 'в сети' : 'был недавно'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Phone" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'calls':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Звонки</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>А</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Анна Петрова</h3>
                  <div className="flex items-center space-x-2">
                    <Icon name="PhoneIncoming" size={14} className="text-green-500" />
                    <span className="text-sm text-muted-foreground">Входящий, 14:30</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Icon name="Phone" size={16} />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>М</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Максим Иванов</h3>
                  <div className="flex items-center space-x-2">
                    <Icon name="PhoneOutgoing" size={14} className="text-blue-500" />
                    <span className="text-sm text-muted-foreground">Исходящий, Вчера</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Icon name="Video" size={16} />
                </Button>
              </div>
            </div>
          </div>
        )
      
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Настройки</h2>
            
            {/* Profile section */}
            <div className="bg-card p-6 rounded-lg mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>Я</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Ваш профиль</h3>
                  <p className="text-muted-foreground">+7 (999) 123-45-67</p>
                </div>
              </div>
              <Button variant="outline">Редактировать профиль</Button>
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
    <div className="h-screen bg-background text-foreground font-inter flex flex-col">
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