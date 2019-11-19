import { withSize } from 'react-sizeme';
import { withRouter } from 'react-router-dom';
import BG from './BGContainer';

export default withRouter(withSize({ monitorHeight: true, monitorWidth: true })(BG));
