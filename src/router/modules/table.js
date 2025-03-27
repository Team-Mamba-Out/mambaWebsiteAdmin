/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/check',
  component: Layout,
  redirect: '/check/Record',
  name: 'Check',
  meta: {
    title: 'Check',
    icon: 'table',
    roles: ['supplier','admin','employee']
  },
  children: [
    {
      path: 'Room',
      component: () => import('@/views/table/Room'),
      name: 'Room',
      meta: { title: 'Room', roles: ['admin']}
    },
    // {
    //   path: 'inline-edit-table',
    //   component: () => import('@/views/table/inline-edit-table'),
    //   name: 'InlineEditTable',
    //   meta: { title: '2' }
    // },
    {
      path: 'Record',
      component: () => import('@/views/table/Record'),
      name: 'Record',
      meta: { title: 'Record',roles: ['admin'] }
    }
  ]
}
export default tableRouter
