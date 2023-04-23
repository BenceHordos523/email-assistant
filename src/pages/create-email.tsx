/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import MsgReader from "@kenjiuno/msgreader";
import { useState } from "react";

interface emailContentType {
  from: string;
  subject: string;
  content: string;
}

const removeBoschPart = (inputString: string) => {
  const startIndex = inputString.indexOf("Robert Bosch Elektronika Kft.");
  if (startIndex !== -1) {
    return inputString.substring(0, startIndex);
  } else {
    return inputString;
  }
};

const removeHash = (inputString: string) => {
  const startIndex = inputString.indexOf("####");
  if (startIndex !== -1) {
    return inputString.substring(startIndex + 4, inputString.length);
  } else {
    return inputString;
  }
};

const EmailFeed = () => {
  const { data: emails } = api.emails.list.useQuery();

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        {emails?.map((email) => {
          email = {
            ...email,
            response: removeHash(email.response),
          };

          const splittedResponse = email.response.split("To-Do List:");

          return (
            <div
              className="flex w-full flex-row justify-evenly gap-3"
              key={email.id}
            >
              <div className="w-50 h-[200px] overflow-auto">
                <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <p className="whitespace-pre-line font-bold text-gray-700 dark:text-gray-400">
                    From: {email.from}
                  </p>
                  <div className="mt-1 font-bold text-gray-700 dark:text-gray-400">
                    Subject: {email.subject}
                  </div>
                  <p
                    className="mt-1 whitespace-pre-line font-normal text-gray-700 dark:text-gray-400"
                    style={{ fontFamily: "Courier New, monospace" }}
                  >
                    Content: {"\n"}
                    {email.content}
                  </p>
                </div>
              </div>
              <div className="w-50 h-[200px] overflow-auto">
                <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <p className="font-bold text-gray-700 dark:text-gray-400">
                    AI Response:
                  </p>

                  <div className="whitespace-pre-line font-normal text-gray-700 dark:text-gray-400">
                    {splittedResponse[0]}
                  </div>

                  <p className="mt-2 font-bold text-gray-700 dark:text-gray-400">
                    To-Do:
                  </p>

                  <div className="whitespace-pre-line font-normal text-gray-700 dark:text-gray-400">
                    {splittedResponse[1]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700"></hr>
      </div>
    </>
  );
};

const CreateEmail: NextPage = () => {
  /*const [emailContent, setEmailContent] = useState<emailContentType>({
    from: "",
    subject: "",
    content: "",
  });*/

  const [emailContent, setEmailContent] = useState<emailContentType[]>([]);
  const ctx = api.useContext();
  const { mutateAsync, isLoading } = api.emails.create.useMutation<
    emailContentType[]
  >({
    onSuccess: () => {
      setEmailContent([]);
      void ctx.emails.list.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        alert(errorMessage[0]);
      } else {
        alert("Failed to post! Please try again later.");
      }
    },
  });

  async function createFileBuffer(file: File): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = Buffer.from(reader.result as ArrayBuffer);
        resolve(buffer);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  const processEmail = async (recEmail: File) => {
    const file = recEmail;

    if (!file) return;

    const msgFileBuffer = await createFileBuffer(file);
    const testMsg = new MsgReader(msgFileBuffer);
    const testMsgInfo = testMsg.getFileData();

    if (!testMsgInfo) return;

    const { body, senderEmail, subject } = testMsgInfo;

    if (!body) return;
    if (!senderEmail) return;
    if (!subject) return;

    setEmailContent((prev) => [
      ...prev,
      { from: senderEmail, subject, content: removeBoschPart(body) },
    ]);

    /*setEmailContent({
      from: senderEmail,
      subject: subject,
      content: removeBoschPart(body),
    });*/
  };

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.files);

    if (!e.target.files) return;

    if (e.target.files.length > 1) {
      const files = Array.from(e.target.files);
      files.map(async (file) => {
        await processEmail(file);
      });
    } else {
      const file = e.target.files[0];

      if (!file) return;

      await processEmail(file);
    }
  };

  return (
    <>
      <Head>
        <title>E-Mail AI</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen  flex-col items-center justify-start">
        <div className="container flex max-w-xl flex-col items-center justify-center gap-2 px-4 py-16 ">
          <div>
            <h2 className="text-4xl font-extrabold dark:text-white">
              E-Mail Assistant AI
            </h2>
            <p className="my-4 text-lg text-gray-500">
              To use the summary and prioritization function of E-Mail
              Assistant, simply upload your Microsoft Outlook msg files to the
              app.
            </p>
            <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              The app will then process the emails and send the data over to
              ChatGPT. ChatGPT will analyze the content of each email and
              generate a summary of the key action items.
            </p>
            <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
              This summary is then used to create a to-do list, which is
              prioritized based on the importance and urgency of each task.
            </p>
          </div>
          <div className="w-full">
            <form>
              <label
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="multiple_files"
              >
                Select multiple e-mails
              </label>
              <input
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                id="multiple_files"
                type="file"
                onChange={(e) => handleOnChange(e)}
                multiple
              />
              <p
                className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                id="file_input_help"
              >
                .msg files only
              </p>
              <button
                type="button"
                className="mb-2 mr-2 mt-3 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => mutateAsync(emailContent)}
              >
                Process
              </button>
            </form>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center">
            <div role="status">
              <svg
                aria-hidden="true"
                className="mr-2 inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        <EmailFeed />
      </main>
    </>
  );
};

export default CreateEmail;
