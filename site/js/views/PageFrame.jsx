import {Box} from 'grommet';
import React from 'react';

export default ({children}) => <Box pad={({vertical: 'medium', horizontal: 'large'})} direction="column" alignContent="stretch">
  {children}
  </Box>
