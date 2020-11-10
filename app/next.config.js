require('dotenv').config()

module.exports = {
    async redirects() {
        return [
            {
                source: '/authen/:param',
                destination: '/login',
                permanent: true,
            },
        ]
    },
}