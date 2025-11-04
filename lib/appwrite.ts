import { Category, CreateUserParams, GetMenuParams, MenuItem, SignInParams, User } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  platform: "com.davidleotech.fooddelivery",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseID: "6908b9df001780ce67e0",
  buckedID: "669936f200361e0f1279",
  userCollectionID: "6908ba060020f648ab42",
  categoriesCollectionID: "690916fc0025bf501785",
  menuCollectionId: "6909178a00177c11cc00",
  customizationCollectionID: "69091879002ced81f045",
  menuCustomizationCollectionID: "690919260000c192681d",


  // productCollectionID: "6908b9df001780ce67e4",
  // orderCollectionID: "6908b9df001780ce67e6",
};

const client = new Client();

client 
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform)

export const accounts = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client)
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
    return currentUser.documents[0] as unknown as User
  } catch (error) {
    console.log(error)
    throw new Error(error as string)
  }
}

export const getMenu = async ({category, query}: GetMenuParams) => {

  try {
    const queries: string[] = [];
    if(category){
      queries.push(Query.equal("categories", category))
    }
    if(query){
      queries.push(Query.equal("name", query))
    }

    const menus = await databases.listDocuments(
      appwriteConfig.databaseID,
      appwriteConfig.menuCollectionId,
      queries
    )

    return menus.documents as unknown as MenuItem[]
  } catch (error) {
    throw new Error(error as string)
  }
}
export const getCategories = async (): Promise<Category[] | undefined> => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseID,
      appwriteConfig.categoriesCollectionID
    )
    return categories.documents as unknown as Category[]
  } catch (error) {
    throw new Error(error as string)
  }
}