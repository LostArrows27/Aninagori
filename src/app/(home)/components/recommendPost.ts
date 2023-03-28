import { formatDuration } from "@/components/utils/formatDuration"
import { db } from "@/firebase/firebase-app"
import { UserInfo } from "@/global/UserInfo.types"
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore"

async function getLastView(myUserInfo: UserInfo) {
  const preferenceDoc = doc(db, "postPreferences", myUserInfo.username)
  const snapshot = await getDoc(preferenceDoc)
  if (!snapshot.exists()) {
    await setDoc(preferenceDoc, { last_view: serverTimestamp() }, { merge: true })
  }
  return snapshot.data()?.last_view || 1
}

async function updateLastView(myUserInfo: UserInfo) {
  const preferenceDoc = doc(db, "postPreferences", myUserInfo.username)
  await setDoc(preferenceDoc, { last_view: serverTimestamp() }, { merge: true })
}

async function getFriendList(myUserInfo: UserInfo): Promise<string[]> {
  const userDoc = doc(db, "users", myUserInfo.id)
  const snapshot = await getDoc(userDoc)
  return snapshot.data()?.friend_list?.map((friend: any) => friend.username)
}

async function fetchMyAnimeList(myUserInfo: UserInfo) {
  const malRef = doc(db, "myAnimeList", myUserInfo.username)
  const myAnimeList = (await getDoc(malRef)).data()

  return myAnimeList;
}

function formatPostData(querySnapshot: any) {
  const fetchedPosts = querySnapshot.docs.map((doc: any) => {
    return {
      ...doc.data(),
      lastComment: doc.data().lastComment && {
        ...doc.data().lastComment,
        timestamp: formatDuration(new Date().getTime() - doc.data().lastComment.timestamp.toDate().getTime()),
      },
      timestamp: formatDuration(new Date().getTime() - doc.data().timestamp.toDate().getTime()),
      id: doc.id
    } as any
  });

  return {
    posts: fetchedPosts,
    lastKey: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
}

async function fetchProfilePosts(profileUsername: string, lastKey: any) {
  const postQuery = query(collection(db, "posts"), where("authorName", "==", profileUsername), orderBy("timestamp", "desc"), startAfter(lastKey), limit(1))
  const querySnapshot = await getDocs(postQuery)

  return formatPostData(querySnapshot)
}

async function fetchFriendPosts(myUserInfo: UserInfo, friendList: string[], lastView: Timestamp, lastKey: any) {
  const usernameList = friendList.slice(0)
  usernameList.push(myUserInfo.username)

  const postQuery = query(collection(db, "posts"), where("authorName", "in", usernameList), where("timestamp", ">=", lastView), orderBy("timestamp", "desc"), startAfter(lastKey), limit(1))
  const querySnapshot = await getDocs(postQuery)

  return formatPostData(querySnapshot)
}

async function fetchAllPosts(friendPostIds: string[], lastKey: any) {
  let copyLastKey = lastKey
  do {
    const postQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"), startAfter(copyLastKey), limit(1))
    const querySnapshot = await getDocs(postQuery)

    if (friendPostIds.includes(querySnapshot.docs[0].id)) {
      copyLastKey = querySnapshot.docs[0]
    } else {
      return formatPostData(querySnapshot)
    }

  } while (true)
}

function getAnimePreferenceScore(myAnimeList: any, anime_id: string): number {
  const anime = myAnimeList?.find((anime: any) => anime.node.id === anime_id)

  if (anime?.list_status.status === "watching") return 0;
  if (anime?.list_status.status === "dropped") return 4;
  if (anime?.list_status.status === "completed") {
    if (anime?.list_status.score >= 8) return 10;
    if (anime?.list_status.score >= 6) return 4;
    return 2;
  }

  if (!anime) {
    return 10;
  }

  return 10;
}

export { getLastView, updateLastView, getFriendList, fetchProfilePosts, fetchFriendPosts, fetchAllPosts, getAnimePreferenceScore, fetchMyAnimeList }