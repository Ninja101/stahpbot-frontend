
const aws_config = require( './aws-credentials' ),
	cf_config = require( './cf-credentials' );

const gulp = require( 'gulp' ),
	s3 = require( 'gulp-s3-upload' )( aws_config ),
	cloudfront = require( 'gulp-cloudfront-invalidate' ),
	cloudflare = require( 'gulp-cloudflare' ),
    gzip = require( 'gulp-gzip' );

gulp.task( 'invalidate', ( ) =>
{
    const cf_settings = {
        distribution: aws_config.distributionId,
        paths: [ '/index.html' ],
        accessKeyId: aws_config.accessKeyId,
        secretAccessKey: aws_config.secretAccessKey,
        wait: false
    };

    cloudflare( cf_config );

    return gulp.src( "./dist/index.html" )
        .pipe( cloudfront( cf_settings ) );
});

gulp.task( 'deploy', ( ) =>
{
    let cache_expires = new Date( );
    cache_expires.setUTCFullYear( 2050 );

    const static_files = {
        Bucket: 'dashboard.stahpbot.com',
        ACL: 'public-read',
        Expires: cache_expires
    };

    return gulp.src( "./dist/**/*.+(jpeg|jpg|png|bmp|gif|svg|eot|ttf|woff|woff2|html|ico|css|js|gz)" )
        .pipe( s3( static_files ) );
});

gulp.task('compress', ( ) =>
{
    gulp.src( [ './dist/*.js', './dist/*.css' ] )
        .pipe( gzip( ) )
        .pipe( gulp.dest( './dist' ) );
});