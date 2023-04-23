import { Firestore, PartialWithFieldValue } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) =>
    <FirebaseFirestore.DocumentData>data,
  fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) =>
    snapshot.data() as T,
});

const dataPoint = <T>(collectionPath: string) =>
  firestore.collection(collectionPath).withConverter(converter<T>());

export default { dataPoint };
