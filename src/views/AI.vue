<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { BubbleList, Sender, Typewriter } from 'vue-element-plus-x'
import type { BubbleListItemProps } from 'vue-element-plus-x/types/BubbleList'
import { chat } from '@/api/chat'

type listType = BubbleListItemProps & {
  key: number | string;
  role: 'user' | 'ai';
};

const AVATAR_AI = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const AVATAR_USER = '/images/user.png'

const loading = ref(false)
const inputValue = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)
const innerListRef = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null

const list = ref<listType[]>([
  {
    key: 1,
    role: 'ai',
    content: '📚 你好！我是你的图书推荐 AI 助手～告诉我你的兴趣或想看的类型，我会为你推荐合适的书籍！',
    placement: 'start',
    noStyle: true,
    avatar: AVATAR_AI,
    avatarSize: '40px',
    avatarGap: '12px',
    typing: false,
    isMarkdown: true
  }
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

onMounted(() => {
  observer = new ResizeObserver(() => {
    scrollToBottom()
  })
  if (innerListRef.value) {
    observer.observe(innerListRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const handleSend = async (text: string) => {
  if (!text.trim()) return

  list.value.push({
    key: Date.now(),
    role: 'user',
    content: text,
    placement: 'end',
    noStyle: true,
    avatar: AVATAR_USER,
    avatarSize: '40px',
    avatarGap: '12px'
  })

  inputValue.value = ''
  loading.value = true

  list.value.push({
    key: Date.now() + 1,
    role: 'ai',
    content: '',
    placement: 'start',
    noStyle: true,
    avatar: AVATAR_AI,
    avatarSize: '40px',
    avatarGap: '12px',
    loading: true,
    typing: false
  })

  try {
    const res = await chat(text)
    const aiText = res?.data || '（AI 暂时没有返回内容）'

    list.value.pop()

    list.value.push({
      key: Date.now() + 2,
      role: 'ai',
      content: aiText,
      placement: 'start',
      noStyle: true,
      avatar: AVATAR_AI,
      avatarSize: '40px',
      avatarGap: '12px',
      typing: true,
      isMarkdown: true
    })

  } catch {
    list.value.pop()

    list.value.push({
      key: Date.now() + 2,
      role: 'ai',
      content: '⚠️ AI 服务调用失败，请稍后重试。',
      placement: 'start',
      noStyle: true,
      avatar: AVATAR_AI,
      avatarSize: '40px',
      avatarGap: '12px',
      typing: false
    })
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="chat-page">
    <div class="chat-container" ref="chatContainerRef">
      <div ref="innerListRef">
        <BubbleList :list="list" max-height="2000px">

          <template #header="{ item }">
            <div class="header-wrapper">
              <div class="header-name">
                {{ item.role === 'ai' ? 'AI助手🍧' : '' }}
              </div>
            </div>
          </template>

          <template #content="{ item }">

            <div
              class="custom-bubble"
              :class="{ 'is-ai': item.role === 'ai', 'is-user': item.role === 'user' }"
            >
              <Typewriter
                v-if="item.role === 'ai'"
                :content="item.content"
                :typing="item.typing"
                :is-markdown="item.isMarkdown"
                style="font-size: 14px; line-height: 1.6; color: inherit;"
              />
              <span v-else>{{ item.content }}</span>
            </div>

          </template>
        </BubbleList>
      </div>
    </div>

    <div class="sender-box">
      <Sender
        v-model="inputValue"
        :loading="loading"
        placeholder="💌 请输入..."
        @submit="handleSend"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 88vh;
  background-color: #f2f3f5;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}

.sender-box {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.custom-bubble {
  font-size: 14px;
  color: #333;
  padding: 12px;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: fit-content;
}

.custom-bubble.is-ai {
  background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
}

.custom-bubble.is-user {
  background: linear-gradient(to right, #e0c3fc 0%, #8ec5fc 100%);
  color: #333;
}
</style>
