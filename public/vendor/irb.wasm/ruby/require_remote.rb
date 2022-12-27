def require_remote(path)
    response = JS.global.fetch("/vendor/irb.wasm/ruby/#{path}.rb").await
    text = response.text.await
    Kernel.eval(text.to_s, TOPLEVEL_BINDING, path)
end

require_remote 'stdlib_compat'
require_remote 'rubygems_compat'
require_remote 'bundler_compat'
