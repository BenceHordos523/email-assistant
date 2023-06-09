import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>E-Mail assistant - AI</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen  flex-col items-center justify-start">
        <div className="container flex max-w-xl flex-col items-center justify-center gap-2 px-4 py-16 ">
          <div>
            <h2 className="text-4xl font-extrabold dark:text-white">
              Streamline Your Email Workflow with - E-Mail Assistant AI
            </h2>
            <p className="my-4 text-lg text-gray-500">
              Are you tired of sifting through mountains of emails every day? Do
              you find yourself struggling to keep track of all your tasks and
              priorities? Our E-Mail Assistant AI is here to help!
            </p>
            <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              E-Mail Assistant summarizes the content of your emails into clear
              and concise action items, helping you to create a comprehensive
              to-do list with ease. The app also prioritizes your tasks based on
              importance and urgency, ensuring that you stay on top of your
              workload.
            </p>
            <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              Say goodbye to overwhelming email inboxes and hello to streamlined
              productivity with E-Mail Assistant. Try it today and experience
              the power of efficient email management.
            </p>
            <Link
              href="/create-email"
              className="inline-flex items-center text-lg text-blue-600 hover:underline dark:text-blue-500"
            >
              Try it now
              <svg
                className="ml-1 h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
