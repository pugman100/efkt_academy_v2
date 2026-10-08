import { redirect } from 'next/navigation';

// The course catalog is retired: learners see only the courses assigned to them.
// Old links and bookmarks land on the dashboard.
export default function Catalog() {
  redirect('/');
}
