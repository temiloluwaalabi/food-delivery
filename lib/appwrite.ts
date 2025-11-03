import { CreateUserParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  platform: "com.davidleotech.fooddelivery",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseID: "6908b9df001780ce67e0",
  userCollectionID: "6908ba060020f648ab42",
  productCollectionID: "6908b9df001780ce67e4",
  orderCollectionID: "6908b9df001780ce67e6",
};

const client = new Client();

client 
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform)

export const accounts = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserParams) => {

  try {
    const newAccount = await accounts.create(ID.unique(), email, password, name);
    if(!newAccount) throw Error;
    await signIn({email, password})
    const avatarUrl = avatars.getInitialsURL(name)
    return await databases.createDocument(
      appwriteConfig.databaseID, 
      appwriteConfig.userCollectionID, 
      ID.unique(), 
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl
    })
  } catch (error) {
    throw new Error(error as string)
  }
}


export const signIn = async ({email, password}: SignInParams) => {
  try {
    const session = await accounts.createEmailPasswordSession(email, password);
    return session
  } catch (error) {
    throw new Error(error as string)
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await accounts.get();
    if(!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseID,
      appwriteConfig.userCollectionID,
      [
        Query.equal("accountId", currentAccount.$id)
      ]
    )
    if(!currentUser) throw Error;
    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
    throw new Error(error as string)
  }
}