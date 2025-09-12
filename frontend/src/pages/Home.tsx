import Featuresection from "../components/Featuresection"
import Footer from "../components/Footer"
import GetHelp from "../components/GetHelp"
import Herosection from "../components/Herosection"
import Stats from "../components/Stats"
const Home = () => {
  return (
    <>
      <Herosection/>
      <Featuresection/>
      <Stats/>
      <GetHelp/>
      <Footer/>
    </>
  )
}

export default Home