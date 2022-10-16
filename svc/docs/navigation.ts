export const navigation: {
    title: string
    links: {
        title: string
        href: string
    }[]
}[] = [
        {
            title: 'Introduction',
            links: [
                { title: 'Getting started', href: '/' },
            ],
        },
        // {
        //   title: 'Core concepts',
        //   links: [
        //     { title: 'Understanding caching', href: '/docs/understanding-caching' },
        //     {
        //       title: 'Predicting user behavior',
        //       href: '/docs/predicting-user-behavior',
        //     },
        //     { title: 'Basics of time-travel', href: '/docs/basics-of-time-travel' },
        //     {
        //       title: 'Introduction to string theory',
        //       href: '/docs/introduction-to-string-theory',
        //     },
        //     { title: 'The butterfly effect', href: '/docs/the-butterfly-effect' },
        //   ],
        // },

        {
            title: "API reference",
            links: [
                { title: "API Basics", href: "/rest-api" },
                { title: "Checks", href: "/rest-api/checks" },
            ],
        },
    ];