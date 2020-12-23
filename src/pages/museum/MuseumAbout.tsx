import { Link, useParams } from 'react-router-dom';
import Portal from '@src/components/Portal';

const MuseumAbout = () => {
  const { museumId } = useParams<{ museumId: string }>();

  return (
    <div>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museumId}`}>Back</Link>
      </Portal>

      <h1>About</h1>
    </div>
  );
};

export default MuseumAbout;
