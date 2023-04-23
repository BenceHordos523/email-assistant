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

const EmailFeed = () => {
  const { data: emails } = api.emails.list.useQuery();

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        {emails?.map((email) => {
          return (
            <div
              className="flex w-full flex-row justify-evenly gap-3"
              key={email.id}
            >
              <div className="w-50 flex h-[200px] gap-10 overflow-auto">
                <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <p className="font-bold text-gray-700 dark:text-gray-400">
                    From: {email.from}
                  </p>
                  <p className="mt-1 font-bold text-gray-700 dark:text-gray-400">
                    Subject: {email.subject}
                  </p>
                  <p
                    className="mt-1 font-normal text-gray-700 dark:text-gray-400"
                    style={{ fontFamily: "Courier New, monospace" }}
                  >
                    Content: {email.content}
                  </p>
                </div>
              </div>
              <div className="w-50 h-[200px] overflow-auto">
                <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <p className="font-bold text-gray-700 dark:text-gray-400">
                    Summary
                  </p>

                  <div className="font-normal text-gray-700 dark:text-gray-400">
                    {email.response}
                  </div>

                  <p className="mt-2 font-bold text-gray-700 dark:text-gray-400">
                    To-Do:
                  </p>

                  <div className="font-normal text-gray-700 dark:text-gray-400">
                    {email.response}
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

  const { mutateAsync } = api.emails.create.useMutation<emailContentType[]>({
    onSuccess: () => {
      console.log("Success!");
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
        <EmailFeed />
      </main>
    </>
  );
};

export default CreateEmail;
