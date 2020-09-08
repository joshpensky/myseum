import React from 'react';
import Portal from '@src/components/Portal';
import { useHistory } from 'react-router-dom';

const About = () => {
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

export default About;
