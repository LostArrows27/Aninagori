import ChatPopup from '@/components/chat/ChatPopup';
import { UserInfo } from '@/components/nav/NavBar';
import { db } from '@/firebase/firebase-app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { doc, getDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { PostForm, Posts, Message, MessageForm, Messages } from '../../components';

async function getUserInfo(userId: string): Promise<UserInfo | undefined> {
  if (!userId) return;

  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      "id": docSnap.id,
      "username": docSnap.data().username,
      "image": docSnap.data().image,
    }
  } else {
    console.log("No such document in page/getUserInfo()!");
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  const myUserId = (session as any)?.user?.id
  const myUserInfo = await getUserInfo(myUserId)

  if (!myUserInfo) return null

  return (
    <div className='flex justify-center pt-10'>
      <div className="flex flex-col lg:w-2/5 w-3/5">
        <ChatPopup />

        <PostForm avatarUrl={myUserInfo.image} username={myUserInfo.username} />

        {/* @ts-expect-error Server Component */}
        <Posts myUserInfo={myUserInfo} />
      </div>
    </div>
  )
}