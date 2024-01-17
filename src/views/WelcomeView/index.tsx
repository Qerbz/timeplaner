import BreakLine from "~/components/General/BreakLine";
import { useLanguageContext } from "~/contexts/languageContext";
import Header from '~/components/Calendar/Header';

const Welcome = () => {
  const { language } = useLanguageContext();

  const welcomeText = language === 'en' ? 'Welcome to TimePlanner!' : 'Velkommen til TimePlaner!';

  return (
    <div>
      <Header label={welcomeText}/>
      <BreakLine />
    </div>
  );
};

export default Welcome;
