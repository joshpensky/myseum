import { useHistory } from 'react-router-dom';
import Portal from '@src/components/Portal';

const MuseumAbout = () => {
  const history = useHistory();

  return (
    <div>
      <Portal to="nav-left" prepend>
        <button onClick={history.goBack}>Back</button>
      </Portal>

      <h1>About</h1>
    </div>
  );
};

export default MuseumAbout;
