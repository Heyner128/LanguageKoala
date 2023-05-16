import { Firestore, PartialWithFieldValue } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Provides types to firestore data
 */
const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) =>
    <FirebaseFirestore.DocumentData>data,
  fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) =>
    snapshot.data() as T,
});
/**
 * Returns a firestore collection with a converter
 *
 * @param collectionPath - the path to the collection
 */
const dataPoint = <T>(collectionPath: string) =>
  firestore.collection(collectionPath).withConverter(converter<T>());

export default { dataPoint };
