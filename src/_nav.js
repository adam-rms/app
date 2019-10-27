export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
      /*badge: {
        variant: 'info',
        text: 'NEW',
      },*/
    },
    {
      title: true,
      name: 'This Instance',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Projects',
      url: '/projects',
      icon: 'icon-drop',
      children: [
        {
          name: 'Test',
          url: '/base/breadcrumbs',
          icon: 'icon-puzzle',
        },
      ]
    },
    {
      name: 'Assets',
      url: '/assets',
      icon: 'icon-pencil',
    },
    {
      name: 'People',
      url: '/people',
      icon: 'icon-pencil',
    },
    {
      title: true,
      name: 'Instances',
      wrapper: {
        element: '',
        attributes: {},
      },
    },
    {
      divider: true,
    },
    {
      name: 'Billing',
      url: '/billing',
      icon: 'icon-cloud-download',
      class: 'mt-auto',
      variant: 'success',
      attributes: { disabled: false },
    },
  ],
};
