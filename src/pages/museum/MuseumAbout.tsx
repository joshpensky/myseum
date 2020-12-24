import { Link } from 'react-router-dom';
import Portal from '@src/components/Portal';
import { useMuseum } from '@src/providers/MuseumProvider';

const MuseumAbout = () => {
  const { museum } = useMuseum();

  return (
    <div>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museum.id}`}>Back</Link>
      </Portal>

      <h1>About</h1>
    </div>
  );
};

export default MuseumAbout;
