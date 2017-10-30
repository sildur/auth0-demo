$('document').ready(function() {
    var userProfile;
    var content = $('.content');
    var loadingSpinner = $('#loading');
    content.css('display', 'block');
    loadingSpinner.css('display', 'none');

    var webAuth = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        redirectUri: AUTH0_CALLBACK_URL,
        audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
        responseType: 'token id_token',
        scope: 'openid profile',
        leeway: 60
    });

    var homeView = $('#home-view');
    var profileView = $('#profile-view');

    // buttons and event listeners
    var loginBtn = $('#btn-login');
    var logoutBtn = $('#btn-logout');


    loginBtn.click(function(e) {
        e.preventDefault();
        webAuth.authorize();
    });

    logoutBtn.click(logout);

    function setSession(authResult) {
        // Set the time that the access token will expire at
        var expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
    }

    function logout() {
        // Remove tokens and expiry time from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        displayButtons();
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    function displayButtons() {
        var loginStatus = $('.container h4');
        if (isAuthenticated()) {
            loginBtn.css('display', 'none');
            logoutBtn.css('display', 'inline-block');
            getProfile();
        } else {
            homeView.css('display', 'inline-block');
            loginBtn.css('display', 'inline-block');
            logoutBtn.css('display', 'none');
            profileView.css('display', 'none');
            loginStatus.text('You are not logged in! Please log in to continue.');
        }
    }

    function getProfile() {
        if (!userProfile) {
            var accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.log('Access token must exist to fetch profile');
            }

            webAuth.client.userInfo(accessToken, function(err, profile) {
                if (profile) {
                    userProfile = profile;
                    displayProfile();
                }
            });
        } else {
            displayProfile();
        }
    }

    function displayProfile() {
        // display the profile
        $('#profile-view .nickname').text(userProfile.nickname);
        $('#profile-view .country').text(userProfile['https://sildur:auth0:com/country']);
        $('#profile-view img.avatar').attr('src', userProfile.picture);
        var flagUrl = 'https://cdn.rawgit.com/hjnilsson/country-flags/master/svg/' +
            userProfile['https://sildur:auth0:com/countryCode'].toLowerCase() + '.svg';
        $('body').css('background-image', 'url(' + flagUrl + ')');
        profileView.css('display', 'block');
    }

    function handleAuthentication() {
        webAuth.parseHash(function(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                setSession(authResult);
                loginBtn.css('display', 'none');
                homeView.css('display', 'inline-block');
            } else if (err) {
                homeView.css('display', 'inline-block');
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    handleAuthentication();
});
