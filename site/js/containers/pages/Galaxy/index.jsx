import { withSize } from 'react-sizeme';
import { withRouter } from 'react-router-dom';

import Galaxy from './GalaxyContainer';

export default withRouter(withSize({ monitorHeight: true, monitorWidth: true })(Galaxy));
