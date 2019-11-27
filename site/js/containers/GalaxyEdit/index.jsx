import { withSize } from 'react-sizeme';
import { withRouter } from 'react-router-dom';
import GalaxyEditContainer from './GalaxyEditContainer';

export default withRouter(withSize({ monitorHeight: true, monitorWidth: true })(GalaxyEditContainer));
