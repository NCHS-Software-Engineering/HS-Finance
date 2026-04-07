
import Entries from "./components/Entries";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between py-30 px-80 bg-white dark:bg-black sm:items-start">
      <Entries />
    </main>
  );
}
