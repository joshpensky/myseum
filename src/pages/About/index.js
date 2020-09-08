import React from 'react';
import Portal from '@src/components/Portal';
import { Link, useParams } from 'react-router-dom';

const About = () => {
  const params = useParams();

  return (
    <div>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${params.museumId}`} replace>
          Back
        </Link>
      </Portal>

      <h1>About</h1>
    </div>
  );
};

export default About;
