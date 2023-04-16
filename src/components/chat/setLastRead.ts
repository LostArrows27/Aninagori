import { db } from "@/firebase/firebase-app";
import { UserInfo } from "@/global/UserInfo.types";
import { collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function setLastRead(myUserInfo: UserInfo, conversationId: string) {
  const conversationRef = doc(db, "conversation", conversationId);

  const conversation = await getDoc(conversationRef)
  if (!conversation.exists()) return;

  const fieldName = conversation.data()?.username1 === myUserInfo.username ? "user1LastRead" : "user2LastRead"

  updateDoc(conversationRef, {
    [fieldName]: serverTimestamp()
  })
}