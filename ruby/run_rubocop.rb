tmp = "/home/me/tmp"
main_rb = "#{tmp}/main.rb"
output = "#{tmp}/output"

FileUtils.mkdir_p(tmp)

File.write(main_rb, JS.global[:mainRb].to_s)
File.write("#{tmp}/.rubocop.yml", JS.global[:rubocopYml].to_s)

options = {
  cache: 'false',
  formatters: [['json', output]],
  autocorrect: 'true',
}
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = 0
begin
  runner.run([tmp])
rescue Errno::ENOENT
  # FIXME: Fails unexpectedly the first few times
  if retried < 10 
    retried += 1
    # FIXME: Error: /usr/local/lib/ruby/site_ruby/3.2.0+3/js.rb:85:in `[]':
    #        TypeError: Cannot read properties of undefined (reading 'sleep_ms') (JS::Error)
    # sleep(1)
    Kernel.sleep(1)
    retry
  end
  raise
end

{
  json: JSON.parse(File.read(output)),
  corrected: File.read(main_rb),
}.to_json
