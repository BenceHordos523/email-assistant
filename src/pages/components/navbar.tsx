import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  const user = useUser();

  return (
    <nav className="border-b border-gray-200  bg-white dark:bg-gray-900">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-end p-4">
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 md:dark:bg-gray-900">
            <li>
              <Link
                href="/"
                className="block rounded bg-blue-700 py-2 pl-3 pr-4 text-white dark:text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            {user.isSignedIn && (
              <li>
                <Link
                  href="/create-email"
                  className="block rounded bg-blue-700 py-2 pl-3 pr-4 text-white dark:text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500"
                  aria-current="page"
                >
                  E-Mail AI
                </Link>
              </li>
            )}

            {!user.isSignedIn && (
              <li>
                <SignInButton>
                  <span className="block cursor-pointer rounded bg-blue-700 py-2 pl-3 pr-4 text-white dark:text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500">
                    Sign In
                  </span>
                </SignInButton>
              </li>
            )}

            <li>
              <UserButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
