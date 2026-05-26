import PostEditor from '@/components/admin/PostEditor';

export const metadata = { title: 'Nuevo artículo | Admin' };

export default function NewPostPage() {
  return <PostEditor mode="create" />;
}
