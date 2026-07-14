(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userEmail = localStorage.getItem('userEmail');
    
    // Extract page filename
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    
    const publicPages = [
        '',
        'index.html',
        'landing.html',
        '1.user_login.html',
        '2.lawyer_reg.html'
    ];
    
    const isPublicPage = publicPages.includes(currentPage);
    
    // Auth redirect checks
    if (!isPublicPage) {
        if (!token || !userEmail || !role) {
            localStorage.clear();
            window.location.href = '1.user_login.html';
            return;
        }
    }
    
    // Intercept fetch calls to inject Authorization header
    if (token) {
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            init = init || {};
            init.headers = init.headers || {};
            
            // Inject bearer token into headers
            if (init.headers instanceof Headers) {
                if (!init.headers.has('Authorization')) {
                    init.headers.append('Authorization', 'Bearer ' + token);
                }
            } else if (Array.isArray(init.headers)) {
                const hasAuth = init.headers.some(h => h[0].toLowerCase() === 'authorization');
                if (!hasAuth) {
                    init.headers.push(['Authorization', 'Bearer ' + token]);
                }
            } else {
                if (!init.headers['Authorization'] && !init.headers['authorization']) {
                    init.headers['Authorization'] = 'Bearer ' + token;
                }
            }
            
            // Execute the fetch call and intercept 401 status to log out
            return originalFetch(input, init).then(response => {
                if (response.status === 401) {
                    console.warn("Session expired or unauthorized. Logging out...");
                    localStorage.clear();
                    window.location.href = '1.user_login.html';
                }
                return response;
            });
        };
    }
})();
