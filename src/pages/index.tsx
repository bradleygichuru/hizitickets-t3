import type { NextPage } from "next";
import Head from "next/head";
import LoginButton from "../components/LoginButton";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router"

const Home: NextPage = () => {
  const router = useRouter()

  return (
    <>
      <div data-theme="light" className="hero min-h-screen bg-[url('https://placeimg.com/1000/800/arch')]">
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
              <label htmlFor="my-modal-3" className="btn btn-outline" onClick={() => {
                router.push("/events")
              }}>
                View events
              </label>
              <label htmlFor="my-modal-3" className="btn btn-outline" onClick={() => {
                router.push("/dashboard");
              }}>
                Create your event
              </label>
            </div>
          </div>
        </div>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <label htmlFor="my-modal-3" className="btn modal-button btn-primary">
              Get Started
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
