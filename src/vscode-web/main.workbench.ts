import './main.common'
import { remoteAuthority } from './setup.workbench'
// import './main.common'

if (remoteAuthority != null) {
  void import('./features/remoteExtension')
}
