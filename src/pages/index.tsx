import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  /*useEffect(() => {
    const token = localStorage.getItem("visited");
    if (token) {
      router.push("/events");
    } else {
      localStorage.setItem("visited", "true");
    }
  }, []);*/
  return (
    <>
      <section className="bg-gray-50">
        <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
          <input type="checkbox" id="my-modal-3" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <label
                htmlFor="my-modal-3"
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                ✕
              </label>
              <h3 className="font-bold text-lg">
                Start Your experience right now!
              </h3>

              <div className="modal-action">
                <label
                  htmlFor="my-modal-3"
                  className="btn btn-outline"
                  onClick={() => {
                    router.push("/events");
                  }}
                >
                  View events
                </label>
                <label
                  htmlFor="my-modal-3"
                  className="btn btn-outline"
                  onClick={() => {
                    router.push("/dashboard");
                  }}
                >
                  Create your event
                </label>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl block font-extrabold sm:text-5xl">
              We understand your ticketing needs.
              <strong className="font-extrabold mt-4 text-accent sm:block">
                Welcome to Hizitickets.
              </strong>
            </h1>

            <p className="mt-4 sm:text-xl sm:leading-relaxed">
              Home of fast, convinient and simple ticketing
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <label htmlFor="my-modal-3" className="btn modal-button block w-full rounded bg-accent px-12 py-3 text-sm font-medium text-white shadow hover:bg-accent focus:outline-none focus:ring active:bg-red-500 sm:w-auto">
                Get Started
              </label>

              <label className="block w-full rounded px-12 py-3 text-sm font-medium text-accent shadow hover:text-accent focus:outline-none focus:ring active:text-red-500 sm:w-auto">
                Learn More
              </label>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
