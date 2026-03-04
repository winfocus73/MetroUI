// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backend: {
  
	//host: 'https://wspl.ddns.net/services',
	//helpUrl: 'https://wspl.ddns.net/services/HelpSystemService/' // 

	//host: 'https://localhost/services',
	//helpUrl: 'https://localhost/services/HelpSystemService/' // 'http://localhost:4400/view/'
	

	 host: 'http://192.168.14.61/services',
	 helpUrl: 'http://192.168.14.61/services/HelpSystemService/' 

	// host: 'https://nxasm.winfocus.co.in/services',
	// helpUrl: 'https://nxasm.winfocus.co.in/services/HelpSystemService/' // 'http://localhost:4400/view/'

    //host: 'https://test-ams.ltmrhl.int/services',
  	//helpUrl: 'https://test-ams.ltmrhl.int/services/HelpSystemService/' 

   	//host: 'https://ams.ltmetrohyderabad.in/services',
  	//helpUrl: 'https://ams.ltmetrohyderabad.in/services/HelpSystemService/' // 

  },
  oauth: {
    host: 'https://demo0034835.mockable.io',
    client_id: '2',
    client_secret: 'tsN80QNwTawD3WZSX2uziOFI6HstTEs2bXBqsCyv',
    scope: '*',
  },
  movieDB: {
    host: 'https://api.themoviedb.org/3',
  },
  landingDisplayName: 'Trail Railways',
  //landingDisplayName: 'L&T Metro Rail Hyderabad Ltd',
  
	//imagePath: 'https://wspl.ddns.net/services',
	//historyPath: 'https://wspl.ddns.net/services/HelpSystemService/' // 
  
	//imagePath: `https://localhost/services/documentservice/api/docs/`,//,
	//historyPath:`https://localhost/services/documentservice/api/history///`
	
	 //imagePath: `http://192.168.14.61/services/documentservice/api/docs/`,
	 //historyPath:`http://192.168.14.61/services/documentservice/api/history/`

	imagePath: `https://nxasm.winfocus.co.in/services/documentservice/api/docs/`,
	historyPath:`https://nxasm.winfocus.co.in/services/documentservice/api/history/`
	
	//imagePath: 'https://test-ams.ltmrhl.int/services/documentservice/api/docs/',
	//historyPath:'https://test-ams.ltmrhl.int/services/documentservice/api/history/'

	//imagePath: 'https://ams.ltmetrohyderabad.in/services/documentservice/api/docs/',
	//historyPath:'https://ams.ltmetrohyderabad.in/services/documentservice/api/history/'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
