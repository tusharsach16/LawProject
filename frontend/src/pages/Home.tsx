import Featuresection from "../components/Featuresection"
import Footer from "../components/Footer"
import GetHelp from "../components/GetHelp"
import Headers from "../components/Headers"
import Herosection from "../components/Herosection"
import Stats from "../components/Stats"
const Home = () => {
  return (
    <>
      <Headers/>
      <Herosection/>
      <Featuresection/>
      <Stats/>
      <GetHelp/>
      <Footer/>
    </>
  )
}

export default Home