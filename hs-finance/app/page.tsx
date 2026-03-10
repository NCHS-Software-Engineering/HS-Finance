import ChartAccounts from "./components/ChartAccounts";
import Registers from "./components/Registers";
import Entries from "./components/Entries";
import Funds from "./components/Funds";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      <Entries />
    </main>
  );
}
