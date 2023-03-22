import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getUserInfo } from "@/global/getUserInfo";
import PostForm from '../post/[...post_id]/components/post/PostForm';
import Posts from '../post/[...post_id]/components/post/PostContainer';

export default async function Home() {
  const session = await getServerSession(authOptions)
  const myUserId = (session as any)?.user?.id
  const myUserInfo = await getUserInfo(myUserId)

  if (!myUserInfo) return null

  return (
    <div className='flex justify-center pt-10'>
      <div className="flex flex-col lg:w-2/5 w-3/5">
        <PostForm avatarUrl={myUserInfo.image} username={myUserInfo.username} isBanned={!!myUserInfo.is_banned} />

        {/* @ts-expect-error Server Component */}
        <Posts myUserInfo={myUserInfo} />
      </div>
    </div>
  )
}