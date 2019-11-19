import { withSize } from 'react-sizeme';
import { withRouter } from 'react-router-dom';
import FG from './FGContainer';

export default withRouter(withSize({ monitorHeight: true, monitorWidth: true })(FG));
