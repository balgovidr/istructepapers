import Head from "next/head";

export const metadata = {
    title: 'Cookie Policy - Structural Papers',
    description: 'View the cookie policy of Structural Papers.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/statements/cookie-policy',
    },
    openGraph: {
        title: 'Cookie Policy - Structural Papers',
        description: 'View the cookie policy of Structural Papers.',
        url: process.env.NEXT_PUBLIC_HOST + '/statements/cookie-policy',
        siteName: 'Structural Papers',
        images: [
          {
            url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp', // Must be an absolute URL
            width: 1200,
            height: 628,
            alt: 'Image describing Structural Papers',
          },
        ],
        type: 'website',
      },
  }
  
export default function CookiePolicy() {

    return (
        <div class="full-height column text-align-left content px-5">
            <Head>
                <title>Cookie policy - Structural Papers</title>
                <meta name="Cookie policy" content="Cookie policy"/>
            </Head>

            {/* Cookies from https://www.cookiepolicygenerator.com/download.php?lang=en&token=dgh3wJss1FPiW9xurRg116apY0x2rjv1# */}
            <h1 className="mg-t-50">Cookie Policy for Structural Papers</h1>

            <hr class="solid"/>

            <p>This is the Cookie Policy for Structural Papers, accessible from https://structuralpapers.com/</p>

            <p><strong>What Are Cookies</strong></p>

            <p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or &#39;break&#39; certain elements of the sites functionality.</p>

            <p><strong>How We Use Cookies</strong></p>

            <p>We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>

            <p><strong>Disabling Cookies</strong></p>

            <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site. Therefore it is recommended that you do not disable cookies. This Cookies Policy was created with the help of the <a href="https://www.cookiepolicygenerator.com/cookie-policy-generator/">Cookies Policy Generator</a>.</p>
            <p><strong>The Cookies We Set</strong></p>

            <ul>

            <li>
                <p>Account related cookies</p>
                <p>If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.</p>
            </li>

            <li>
                <p>Login related cookies</p>
                <p>We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.</p>
            </li>





            <li>
                <p>Site preferences cookies</p>
                <p>In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this information can be called whenever you interact with a page is affected by your preferences.</p>
            </li>

            </ul>

            <p><strong>Third Party Cookies</strong></p>

            <p>In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.</p>

            <ul>

            <li>
                <p>This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</p>
                <p>For more information on Google Analytics cookies, see the official Google Analytics page.</p>
            </li>




            <li>
                <p>The Google AdSense service we use to serve advertising uses a DoubleClick cookie to serve more relevant ads across the web and limit the number of times that a given ad is shown to you.</p>
                <p>For more information on Google AdSense see the official Google AdSense privacy FAQ.</p>
            </li>





            </ul>

            <p><strong>More Information</strong></p>

            <p>Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren&#39;t sure whether you need or not it&#39;s usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.</p>

            <p>For more general information on cookies, please read <a href="https://www.cookiepolicygenerator.com/sample-cookies-policy/">the Cookies Policy article</a>.</p>

            <p>However if you are still looking for more information then you can contact us through one of our preferred contact methods:</p>

            <ul>
            <li>Email: info@structuralpapers.com</li>

            </ul>

        </div>
    )
}