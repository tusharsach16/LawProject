import { lazy, Suspense } from "react"
import Herosection from "../components/Herosection"
import Footer from "../components/Footer"

const Featuresection = lazy(() => import("../components/Featuresection"))
const Stats = lazy(() => import("../components/Stats"))
const GetHelp = lazy(() => import("../components/GetHelp"))

const Home = () => {
  return (
    <>
      <Herosection />
      <Suspense fallback={null}>
        <Featuresection />
        <Stats />
        <GetHelp />
      </Suspense>
      <Footer />
    </>
  )
}

export default Home
