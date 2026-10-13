export interface Category {
  id: string
  title: string
  channels: string[]
}

export interface Attachment {
  _id: string
  tag: string
  filename: string
  content_type: string
}
